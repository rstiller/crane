function(doc, req) {
    if(doc.type === 'shell-command' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
