function(doc, req) {
    if(doc.type === 'machine' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
