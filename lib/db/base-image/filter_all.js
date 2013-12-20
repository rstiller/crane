function(doc, req) {
    if(doc.type === 'base-image' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
