function(doc, req) {
    if(doc.type === 'shell-command' && !doc['deleted']) {
        return doc.jobId === req.query.job_id;
    } else {
        return false;
    }
}
