function(doc) {
    if(doc.type === 'build-job' && !doc['deleted']) {
        emit(doc.projectId, doc);
    }
}
