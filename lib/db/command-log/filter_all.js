function(doc, req) {
    if(doc.type === 'command-log' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
