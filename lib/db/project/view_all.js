function(doc) {
    if(doc.type === 'project' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
