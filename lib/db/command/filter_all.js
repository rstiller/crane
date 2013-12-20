function(doc, req) {
    if(doc.type === 'command' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
