function(doc, req) {
    if(doc.type === 'build-command' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
