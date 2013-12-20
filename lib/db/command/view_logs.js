function(doc) {
    if(doc.type === 'command' && !doc['deleted']) {
        if(!!doc.logs) {
            for(var i = 0; i < doc.logs.length; i++) {
                emit([doc.logs[i], doc._id], null);
            }
        }
    }
}
