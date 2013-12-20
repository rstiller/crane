function(doc) {
    if(doc.type === 'machine-group' && !doc['deleted']) {
        if(!!doc.machines) {
            for(var i = 0; i < doc.machines.length; i++) {
                emit(doc.machines[i], 1);
            }
        }
    }
}
