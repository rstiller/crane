
var diagram = angular.module('components.diagram');

diagram.directive('sunburstDiagram', ['$compile', '$templateCache', function sunburstFactory($compile, $templateCache) {
    
    return {
        replace: true,
        scope: false,
        templateUrl: 'components/diagram/sunburst.tpl.html',
        link: function($scope, element, attributes, controller) {
            
            var dataAttribute = attributes['diagramData'];
            var data = $scope[dataAttribute];
            
            var width = element[0].offsetWidth;
            var height = element[0].offsetWidth / 2;
            var radius = Math.min(width, height) / 2;
            var getValue = function(d) {
                return d.size;
            };
            
            var x = d3.scale.linear().range([0, 2 * Math.PI]);
            var y = d3.scale.sqrt().range([0, radius]);
            var partition = d3.layout.partition().value(getValue);
            
            var svg = d3.select(element[0]).append('svg')
                .attr('width', width).attr('height', height)
                .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            
            var arc = d3.svg.arc()
                .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
                .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
                .innerRadius(function(d) { return Math.max(0, y(d.y)); })
                .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
            
            var tween = function(d) {
                var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                    yd = d3.interpolate(y.domain(), [d.y, 1]),
                    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                
                return function(d, i) {
                  if(i) {
                      return function(t) {
                          return arc(d);
                      };
                  } else {
                      return function(t) {
                          x.domain(xd(t));
                          y.domain(yd(t)).range(yr(t));
                          return arc(d);
                      };
                  }
                };
            };
            
            var path = null
            var click = function(d) {
                path.transition().duration(250).attrTween('d', tween(d));
            };
            var color = d3.scale.category20c();
            var chooseColor = function(d) {
                return color((d.children ? d : d.parent).name);
            };
            var mouseover = function(d) {};
            var mouseleave = function(d) {};
            
            var render = function() {
                if(!!data) {
                    
                    path = svg.selectAll('path').data(partition.nodes(data)).enter()
                        .append('path')
                        .attr('d', arc)
                        .style('fill', chooseColor)
                        .on('click', click)
                        .on('mouseover', mouseover)
                        .on('mouseleave', mouseleave);
                    
                }
            };
            
            $scope.$watch(dataAttribute, function(value) {
                data = value;
                render();
            });
            
            render();
            
        },
        controller: ['$scope', function($scope) {
        }]
    };
    
}]);
