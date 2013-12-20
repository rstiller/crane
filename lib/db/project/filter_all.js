function(doc, req) {
    if(doc.type === 'project' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
