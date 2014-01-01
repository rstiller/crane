
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;
    var BuildJob = null;

    function Factory() {

        var WorkingCopyType = {
            BRANCH: 'branch',
            TAG: 'tag'
        };

        return BaseEntity.extend({
            defaults: _.extend({}, BaseEntity.prototype.defaults, {
                branches: null,
                name: '',
                tags: null,
                url: '',
                buildTags: true,
                type: 'project'
            }),
            getBuildJobs: function(options) {
                var slf = this;
                var clazz = slf.constructor;
                var query = clazz.query;

                query.apply(clazz, [_.extend({}, options, {
                    params: _.extend({}, options.params, {
                        key: '"' + slf.get('_id') + '"'
                    }),
                    view: 'build-jobs',
                    success: function(model, response) {
                        var objects = [];

                        _.each(model.rows, function(row) {
                            objects.push(new BuildJob(row.value));
                        });

                        if(!!options && !!options.success) {
                            options.success(objects, response, null);
                        }
                    }
                })]);
            },
            destroy: function(options) {
                var slf = this;
                var destroyAll = slf.constructor.destroyAll;

                slf.getBuildJobs({
                    success: function(buildJobs) {
                        destroyAll(buildJobs, {
                            success: function() {
                                BaseEntity.prototype.destroy.apply(slf, options);
                            }
                        });
                    }
                });
            }
        }, {
            TYPE: 'project',
            WORKING_COPY_TYPE: WorkingCopyType,
            getWorkingCopy: function(project, revision) {
                var workingCopy = null;
                var workingCopyName = null;
                var isTag = false;

                angular.forEach(project.get('branches'), function(branch, name) {
                    if(revision === branch.rev) {
                        workingCopy = branch;
                        workingCopyName = name;
                    }
                });

                if(!workingCopy) {
                    angular.forEach(project.get('tags'), function(tag, name) {
                        if(revision === tag.rev) {
                            workingCopy = tag;
                            isTag = true;
                            workingCopyName = name;
                        }
                    });
                }

                return {
                    type: isTag ? WorkingCopyType.TAG : WorkingCopyType.BRANCH,
                    name: workingCopyName,
                    rev: workingCopy.rev,
                    workingCopy: workingCopy
                };
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        BuildJob = require('./build-job').BuildJob;
        DBS = require('../lib/dbs');

        module.exports.Project = Factory();
    } else {
        angular.module('shared.entities').factory('Project', ['_', 'async', 'BaseEntity', 'BuildJob', 'DBS', function(a, b, c, d, e) {
            _ = a;
            async = b;
            BaseEntity = c;
            BuildJob = d;
            DBS = e;

            return Factory();
        }]);
    }

})();
