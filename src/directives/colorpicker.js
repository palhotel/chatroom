//author: https://github.com/buberdds/angular-bootstrap-colorpicker
module.exports = ['$document', '$compile', 'colorService', 'Slider', 'colorHelper', function ($document, $compile, Color, Slider, Helper) {
    'use strict';
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function ($scope, elem, attrs, ngModel) {
            var
                thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
                position = angular.isDefined(attrs.colorpickerPosition) ? attrs.colorpickerPosition : 'bottom',
                inline = angular.isDefined(attrs.colorpickerInline) ? attrs.colorpickerInline : false,
                fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
                target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body),
                withInput = true,
                inputTemplate = '<input type="text" name="colorpicker-input">',
                closeButton = !inline ? '<button type="button" class="close close-colorpicker">&times;</button>' : '',
                template =
                    '<div class="colorpicker dropdown">' +
                    '<div class="dropdown-menu">' +
                    '<colorpicker-saturation><i></i></colorpicker-saturation>' +
                    '<colorpicker-hue><i></i></colorpicker-hue>' +
                    '<colorpicker-alpha><i></i></colorpicker-alpha>' +
                    '<colorpicker-preview></colorpicker-preview>' +
                    inputTemplate +
                    closeButton +
                    '</div>' +
                    '</div>',
                colorpickerTemplate = angular.element(template),
                pickerColor = Color,
                sliderAlpha,
                sliderHue = colorpickerTemplate.find('colorpicker-hue'),
                sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
                colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
                pickerColorPointers = colorpickerTemplate.find('i');

            $compile(colorpickerTemplate)($scope);

            if (withInput) {
                var pickerColorInput = colorpickerTemplate.find('input');
                pickerColorInput
                    .on('mousedown', function(event) {
                        event.stopPropagation();
                    })
                    .on('keyup', function(event) {
                        var newColor = this.value;
                        elem.val(newColor);
                        if(ngModel) {
                            $scope.$apply(ngModel.$setViewValue(newColor));
                        }
                        event.stopPropagation();
                        event.preventDefault();
                    });
                elem.on('keyup', function() {
                    pickerColorInput.val(elem.val());
                });
            }

            var bindMouseEvents = function() {
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            };

            if (thisFormat === 'rgba') {
                colorpickerTemplate.addClass('alpha');
                sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
                sliderAlpha
                    .on('click', function(event) {
                        Slider.setAlpha(event, fixedPosition);
                        mousemove(event);
                    })
                    .on('mousedown', function(event) {
                        Slider.setAlpha(event, fixedPosition);
                        bindMouseEvents();
                    })
                    .on('mouseup', function(event){
                        emitEvent('colorpicker-selected-alpha');
                    });
            }

            sliderHue
                .on('click', function(event) {
                    Slider.setHue(event, fixedPosition);
                    mousemove(event);
                })
                .on('mousedown', function(event) {
                    Slider.setHue(event, fixedPosition);
                    bindMouseEvents();
                })
                .on('mouseup', function(event){
                    emitEvent('colorpicker-selected-hue');
                });

            sliderSaturation
                .on('click', function(event) {
                    Slider.setSaturation(event, fixedPosition);
                    mousemove(event);
                    if (angular.isDefined(attrs.colorpickerCloseOnSelect)) {
                        hideColorpickerTemplate();
                    }
                })
                .on('mousedown', function(event) {
                    Slider.setSaturation(event, fixedPosition);
                    bindMouseEvents();
                })
                .on('mouseup', function(event){
                    emitEvent('colorpicker-selected-saturation');
                });

            if (fixedPosition) {
                colorpickerTemplate.addClass('colorpicker-fixed-position');
            }

            colorpickerTemplate.addClass('colorpicker-position-' + position);
            if (inline === 'true') {
                colorpickerTemplate.addClass('colorpicker-inline');
            }

            target.append(colorpickerTemplate);

            if(ngModel) {
                ngModel.$render = function () {
                    elem.val(ngModel.$viewValue);
                };
                $scope.$watch(attrs.ngModel, function(newVal) {
                    update();

                    if (withInput) {
                        pickerColorInput.val(newVal);
                    }
                });
            }

            elem.on('$destroy', function() {
                colorpickerTemplate.remove();
            });

            var previewColor = function () {
                try {
                    colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
                } catch (e) {
                    colorpickerPreview.css('backgroundColor', pickerColor.toHex());
                }
                sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
                if (thisFormat === 'rgba') {
                    sliderAlpha.css.backgroundColor = pickerColor.toHex();
                }
            };

            var mousemove = function (event) {
                var
                    left = Slider.getLeftPosition(event),
                    top = Slider.getTopPosition(event),
                    slider = Slider.getSlider();

                Slider.setKnob(top, left);

                if (slider.callLeft) {
                    pickerColor[slider.callLeft].call(pickerColor, left / 100);
                }
                if (slider.callTop) {
                    pickerColor[slider.callTop].call(pickerColor, top / 100);
                }
                previewColor();
                var newColor = pickerColor[thisFormat]();
                elem.val(newColor);
                if(ngModel) {
                    $scope.$apply(ngModel.$setViewValue(newColor));
                }
                if (withInput) {
                    pickerColorInput.val(newColor);
                }
                return false;
            };

            var mouseup = function () {
                emitEvent('colorpicker-selected');
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            };

            var update = function () {
                pickerColor.setColor(elem.val());
                pickerColorPointers.eq(0).css({
                    left: pickerColor.value.s * 100 + 'px',
                    top: 100 - pickerColor.value.b * 100 + 'px'
                });
                pickerColorPointers.eq(1).css('top', 100 * (1 - pickerColor.value.h) + 'px');
                pickerColorPointers.eq(2).css('top', 100 * (1 - pickerColor.value.a) + 'px');
                previewColor();
            };

            var getColorpickerTemplatePosition = function() {
                var
                    positionValue,
                    positionOffset = Helper.getOffset(elem[0]);

                if(angular.isDefined(attrs.colorpickerParent)) {
                    positionOffset.left = 0;
                    positionOffset.top = 0;
                }

                if (position === 'top') {
                    positionValue =  {
                        'top': positionOffset.top - 147,
                        'left': positionOffset.left
                    };
                } else if (position === 'right') {
                    positionValue = {
                        'top': positionOffset.top,
                        'left': positionOffset.left + 126
                    };
                } else if (position === 'bottom') {
                    positionValue = {
                        'top': positionOffset.top + elem[0].offsetHeight + 2,
                        'left': positionOffset.left
                    };
                } else if (position === 'left') {
                    positionValue = {
                        'top': positionOffset.top,
                        'left': positionOffset.left - 150
                    };
                }
                return {
                    'top': positionValue.top + 'px',
                    'left': positionValue.left + 'px'
                };
            };

            var documentMousedownHandler = function() {
                hideColorpickerTemplate();
            };

            var showColorpickerTemplate = function() {

                if (!colorpickerTemplate.hasClass('colorpicker-visible')) {
                    update();
                    colorpickerTemplate
                        .addClass('colorpicker-visible')
                        .css(getColorpickerTemplatePosition());
                    emitEvent('colorpicker-shown');

                    if (inline === false) {
                        // register global mousedown event to hide the colorpicker
                        $document.on('mousedown', documentMousedownHandler);
                    }

                    if (attrs.colorpickerIsOpen) {
                        $scope[attrs.colorpickerIsOpen] = true;
                        if (!$scope.$$phase) {
                            $scope.$digest(); //trigger the watcher to fire
                        }
                    }
                }

            };

            if(inline === false) {
                elem.on('click', showColorpickerTemplate);
            } else {
                showColorpickerTemplate();
            }

            colorpickerTemplate.on('mousedown', function (event) {
                event.stopPropagation();
                event.preventDefault();
            });

            var emitEvent = function(name) {
                if(ngModel) {
                    $scope.$emit(name, {
                        name: attrs.ngModel,
                        value: ngModel.$modelValue
                    });
                }
            };

            var hideColorpickerTemplate = function() {
                if (colorpickerTemplate.hasClass('colorpicker-visible')) {
                    colorpickerTemplate.removeClass('colorpicker-visible');
                    emitEvent('colorpicker-closed');
                    // unregister the global mousedown event
                    $document.off('mousedown', documentMousedownHandler);

                    if (attrs.colorpickerIsOpen) {
                        $scope[attrs.colorpickerIsOpen] = false;
                        if (!$scope.$$phase) {
                            $scope.$digest(); //trigger the watcher to fire
                        }
                    }
                }
            };

            colorpickerTemplate.find('button').on('click', function () {
                hideColorpickerTemplate();
            });

            if (attrs.colorpickerIsOpen) {
                $scope.$watch(attrs.colorpickerIsOpen, function(shouldBeOpen) {

                    if (shouldBeOpen === true) {
                        showColorpickerTemplate();
                    } else if (shouldBeOpen === false) {
                        hideColorpickerTemplate();
                    }

                });
            }

        }
    };
}];
