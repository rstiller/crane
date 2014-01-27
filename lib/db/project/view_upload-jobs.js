function(doc) {
    if(doc.type === 'upload-job' && !doc['deleted']) {
        emit(doc.projectId, doc);
    }
}
