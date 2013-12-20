function(doc) {
    if(doc.type === 'machine-group' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
