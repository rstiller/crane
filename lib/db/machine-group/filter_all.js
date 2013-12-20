function(doc, req) {
    if(doc.type === 'machine-group' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
