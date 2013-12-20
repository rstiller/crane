function(doc) {
    if(doc.type === 'command' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
