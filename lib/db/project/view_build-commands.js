function(doc) {
    if(doc.type === 'build-command' && !doc['deleted']) {
        emit(doc.projectId, doc);
    }
}
