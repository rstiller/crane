function(doc) {
    if(doc.type === 'project' && !doc['deleted']) {
    	if(!!doc.branches) {
    		for(var name in doc.branches) {
    			for(var environment in doc.branches[name].infrastructure.environments) {
    				for(var service in doc.branches[name].infrastructure.services) {
    			        emit(doc._id, {
    			        	id: doc._id,
    			        	ref: doc.branches[name].rev,
    			        	type: 'branch',
    			        	project: doc.name,
    			        	version: name,
    			        	environment: environment,
    			        	service: service
    			        });
        			}
    			}
    		}
    	}
    	
    	if(!!doc.tags) {
    		for(var name in doc.tags) {
    			for(var environment in doc.tags[name].infrastructure.environments) {
    				for(var service in doc.tags[name].infrastructure.services) {
    			        emit(doc._id, {
    			        	id: doc._id,
    			        	ref: doc.tags[name].rev,
    			        	type: 'tag',
    			        	project: doc.name,
    			        	version: name,
    			        	environment: environment,
    			        	service: service
    			        });
        			}
    			}
    		}
    	}
    }
}
