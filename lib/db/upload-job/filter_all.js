function(doc, req) {
    if(doc.type === 'upload-job' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
