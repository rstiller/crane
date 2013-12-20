function(doc) {
    if(doc.type === 'machine' && !doc['deleted']) {
        if(!!doc.groups) {
            for(var i = 0; i < doc.groups.length; i++) {
                emit(doc.groups[i], null);
            }
        }
    }
}
