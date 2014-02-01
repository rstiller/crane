function(doc, req) {
    if(doc.type === 'build-job' && !doc['deleted']) {
        if( doc.projectId === req.query.project_id &&
            	doc.environment === req.query.environment &&
            	doc.service === req.query.service &&
            	doc.workingCopyRev === req.query.version) {
        	return true;
        }
    }
    return false;
}
