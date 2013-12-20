function(doc) {
    if(doc.type === 'machine' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
