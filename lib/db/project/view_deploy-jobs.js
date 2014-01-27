function(doc) {
    if(doc.type === 'deploy-job' && !doc['deleted']) {
        emit(doc.projectId, doc);
    }
}
