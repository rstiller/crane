function(doc) {
    if(doc.type === 'shell-command' && !doc['deleted']) {
        emit(doc._id, doc);
    }
}
