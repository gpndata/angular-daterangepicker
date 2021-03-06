(function() {
  define(['moment'], function(moment) {
    var picker;
    picker = angular.module('daterangepicker', []);
    picker.value('dateRangePickerConfig', {
      separator: ' - ',
      format: 'YYYY-MM-DD'
    });
    return picker.directive('dateRangePicker', ['$compile', '$timeout', '$parse', 'dateRangePickerConfig', function($compile, $timeout, $parse, dateRangePickerConfig) {
      return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
          dateMin: '=min',
          dateMax: '=max',
          opts: '=options',
          chosenLabel: '=chosenLabel'
        },
        link: function($scope, element, attrs, modelCtrl) {
          var customOpts, el, opts, parentEl, _formatted, _getPicker, _init, _validateMax, _validateMin;
          el = $(element);
          customOpts = $parse(attrs.dateRangePicker)($scope, {});
          parentEl = customOpts.parentEl || '';
          parentEl = $(parentEl).css('display', 'none');
          opts = angular.extend(dateRangePickerConfig, customOpts, $scope.opts);
          _formatted = function(viewVal) {
            var f;
            f = function(date) {
              if (!moment.isMoment(date)) {
                return moment(date).format(opts.format);
              }
              return date.format(opts.format);
            };
            if (opts.singleDatePicker) {
              return f(viewVal.startDate);
            } else {
              return [f(viewVal.startDate), f(viewVal.endDate)].join(opts.separator);
            }
          };
          _validateMin = function(min, start) {
            var valid;
            min = moment(min);
            start = moment(start);
            valid = min.isBefore(start) || min.isSame(start, 'day');
            modelCtrl.$setValidity('min', valid);
            return valid;
          };
          _validateMax = function(max, end) {
            var valid;
            max = moment(max);
            end = moment(end);
            valid = max.isAfter(end) || max.isSame(end, 'day');
            modelCtrl.$setValidity('max', valid);
            return valid;
          };
          modelCtrl.$formatters.push(function(val) {
            if (val && val.startDate && val.endDate) {
              picker = _getPicker();
              picker.setStartDate(val.startDate);
              picker.setEndDate(val.endDate);
              $scope.chosenLabel = picker.chosenLabel;
              parentEl.css('display', 'block');
              return val;
            }
            return '';
          });
          modelCtrl.$parsers.push(function(val) {
            if (!angular.isObject(val) || !(val.hasOwnProperty('startDate') && val.hasOwnProperty('endDate'))) {
              return modelCtrl.$modelValue;
            }
            if ($scope.dateMin && val.startDate) {
              _validateMin($scope.dateMin, val.startDate);
            } else {
              modelCtrl.$setValidity('min', true);
            }
            if ($scope.dateMax && val.endDate) {
              _validateMax($scope.dateMax, val.endDate);
            } else {
              modelCtrl.$setValidity('max', true);
            }
            return val;
          });
          modelCtrl.$isEmpty = function(val) {
            return !val || (val.startDate === null || val.endDate === null);
          };
          modelCtrl.$render = function() {
            if (!modelCtrl.$modelValue) {
              return el.val('');
            }
            if (modelCtrl.$modelValue.startDate === null) {
              return el.val('');
            }
            return el.val(_formatted(modelCtrl.$modelValue));
          };
          _init = function() {
            return el.daterangepicker(opts, function(start, end, label) {
              $scope.chosenLabel = this.chosenLabel;
              return $timeout(function() {
                return $scope.$apply(function() {
                  modelCtrl.$setViewValue({
                    startDate: start.toDate(),
                    endDate: end.toDate()
                  });
                  return modelCtrl.$render();
                });
              });
            });
          };
          _getPicker = function() {
            return el.data('daterangepicker');
          };
          _init();
          return el.change(function() {
            if ($.trim(el.val()) === '') {
              return $timeout(function() {
                return $scope.$apply(function() {
                  return modelCtrl.$setViewValue({
                    startDate: null,
                    endDate: null
                  });
                });
              });
            }
          });
        }
      };
    }]);
  });

}).call(this);
