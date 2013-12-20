function(doc) {
    if(doc.type === 'base-image' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
