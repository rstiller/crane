function(doc) {
    if(doc.type === 'command-log' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
