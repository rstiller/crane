function(doc, req) {
    if(doc.type === 'build-job' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
