$( document ).ready( async function() {
    let data = {}
    let jsoneditor = null
    let defaultSchema = {}
    let jsonEditorForm = document.getElementById('basic-config-editor')
    let defaultOptions = {
        ajax: true,
        theme: "bootstrap4",
        iconlib: "fontawesome5",
        disable_edit_json: true,
        disable_properties: true,
        remove_button_labels: true,
        no_additional_properties: true,
        schema: defaultSchema
    }

    let editorPrefix = document.getElementById("editor-prefix").value
    let apiPrefix = document.getElementById("api-prefix").value
    let schemaPrefix = document.getElementById("schema-prefix").value
    const currentUrl = new URL(window.location.href)
    let apiEndpoint = apiPrefix + currentUrl.pathname.slice(editorPrefix.length) + currentUrl.search
    let editorRelatedUrl = currentUrl.pathname.slice(editorPrefix.length)
    let schemaEditUrl = schemaPrefix + editorRelatedUrl.split("/_id/")[0] + "/edit.json"
    let schemaSearchUrl = schemaPrefix + editorRelatedUrl + "/search.json"
    let schemaDisplayUrl = schemaPrefix + editorRelatedUrl + "/display.json"
    let schemaActionUrl = schemaPrefix + editorRelatedUrl.split("/_id/")[0] + "/actions/" + currentUrl.pathname.split("/").pop() + ".json"
    let defaultValue = {}
    let emptyValue = {}

    const pageMessage = $('#page-message')
    const downloadResponse = $('#download-response')
    const searchButton = $('#search-document')
    const createButton = $('#create-document')
    const saveButton = $('#save-document')
    const updateButton = $('#update-document')
    const deleteButton = $('#delete-document')
    const executeButton = $('#execute-action')
    const collectionButton = $('.xia-collection-button')
    const documentButton = $('.xia-document-button')
    const actionButton = $('.xia-action-button')

    const refreshMessage = function (messageText, messageLevel = "success") {
        if (messageLevel === 'error') {
            pageMessage.text(messageText).show().addClass("alert-danger")
            setTimeout(function fadeMessage(){ pageMessage.hide("slow").removeClass("alert-danger"); }, 5000);
        } else if (messageLevel === 'warning') {
            pageMessage.text(messageText).show().addClass("alert-warning")
            setTimeout(function fadeMessage(){ pageMessage.hide("slow").removeClass("alert-warning"); }, 5000);
        } else {
            pageMessage.text(messageText).show().addClass("alert-success")
            setTimeout(function fadeMessage(){ pageMessage.hide("slow").removeClass("alert-success"); }, 5000);
        }
    }
    
    const patrolData = (obj, path) => {
        if (obj !== null && obj.constructor === Array) {
            obj.forEach((item, index) => {
                patrolData(item, path + '.' + index);
            })
        } else if (obj !== null && obj.constructor === Object) {
            Object.keys(obj).forEach(key => {
                if (obj[key] !== null && obj[key].constructor === Object) {
                    path = path + '.' + key
                    if ('_mode' in obj[key] && '_lazy' in obj[key] && '_catalog' in obj[key]) {
                        console.log('node:' + path)
                        console.log(JSON.stringify(obj[key]))
                    }
                    patrolData(obj[key], path);
                }
            })
        }
    }
    
    function delay(time) { return new Promise(resolve => setTimeout(resolve, time));}

    const refreshJsoneditor = async function (schemaApi, dataApi, asCollection, readOnly = true) {
        if (jsoneditor) {
            jsoneditor.destroy()
        }
        let dataSchema = await fetch(schemaApi).then((response) => response.json())
        let fullDocData = Object;
        if (asCollection) {
            data.options.schema = {
                title: "Collection Operations",
                type: "array",
                format: "tabs",
                items: dataSchema
            }
        } else {
            data.options.schema = dataSchema
        }

        jsoneditor = new window.JSONEditor(jsonEditorForm, data.options)
        jsoneditor.on('ready', async () => {
            defaultValue = jsoneditor.getValue();
            jsoneditor.setValue({});
            emptyValue = jsoneditor.getValue();
            if (dataApi === null) {
                jsoneditor.setValue(defaultValue);
            } else if (dataApi === "") {
                jsoneditor.setValue({});
            } else {
                await fetch(dataApi)
                    .then((response) => response.json())
                    .then((docData) => {
                        fullDocData = docData
                        jsoneditor.setValue(jQuery.extend(true, defaultValue, docData));
                    });
                await delay(1);
                patrolData(fullDocData, 'root');
            }
            if (readOnly) { jsoneditor.disable(); } else { jsoneditor.enable();}
        });
    }

    const downloadJson = function (payload) {
        let payloadString = JSON.stringify(payload);
        let payloadBytes = new TextEncoder().encode(payloadString);
        const fileContent = new Blob([payloadBytes], { type: "application/json;charset=utf-8" });
        let fileUrl = window.URL.createObjectURL(fileContent);
        let fileElement = document.createElement('a');
        fileElement.href = fileUrl
        fileElement.download = "payload.json"
        document.body.append(fileElement)
        fileElement.click()
        fileElement.remove()
    }

    const downloadBlob = function (fileName, fileContent) {
        if (fileContent) {
            let fileUrl = window.URL.createObjectURL(fileContent);
            let fileElement = document.createElement('a');
            fileElement.href = fileUrl
            fileElement.download = fileName
            document.body.append(fileElement)
            fileElement.click()
            fileElement.remove()
        } else {
            alert("Empty file, download skipped")
        }
    }

    searchButton.click(async function() {
        // List = refresh search criteria. Dictionary = Search criteria
        let editorData = jsoneditor.getValue()
        if ( editorData.constructor !== Object ) {
            refreshMessage("Press Search Button to start searching")
            await refreshJsoneditor(schemaEditUrl, null, false, false);
        } else {
            editorData = Object.fromEntries(Object.entries(editorData).filter(([key, value]) => value!==""));
            if (JSON.stringify(editorData) === "{}") {
                refreshMessage("Please provide search criteria")
                await refreshJsoneditor(schemaEditUrl, null, false, false);
            } else {
                let searchParams = Object.fromEntries(Object.entries(editorData).filter(([key, value]) => value!=="" && value.constructor !== Object && value.constructor !== Array));
                window.location.replace(currentUrl.pathname + "?" + $.param( searchParams ))
            }
        }
    })

    createButton.click(async function() {
        saveButton.show()
        refreshMessage("Press Save Button to create a new document")
        await refreshJsoneditor(schemaEditUrl, null, false, false);
    })

    saveButton.click(async function() {
        let editorData = jsoneditor.getValue()
        if ( editorData.constructor !== Object) {
            refreshMessage("Wrong save format", "warning")
            await refreshJsoneditor(schemaEditUrl, null, false);
        } else if (JSON.stringify(editorData) === JSON.stringify(defaultValue) || JSON.stringify(editorData) === JSON.stringify(emptyValue) ) {
            refreshMessage("Please modify some value before save", "warning")
            await refreshJsoneditor(schemaEditUrl, null, false);
        } else {
            fetch(apiPrefix + currentUrl.pathname.slice(editorPrefix.length), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([editorData])
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        refreshMessage("Data successfully created")
                        await refreshJsoneditor(schemaEditUrl, null, false, false);
                    } else {
                        refreshMessage("Error occurs during operation", "error")
                    }
                    if (downloadResponse.prop('checked')) {
                        downloadJson(await response.json())
                    }
                })
        }
    })

    updateButton.click(async function() {
        let editorData = jsoneditor.getValue()
        if ( editorData.constructor === Object ) {
            fetch(apiPrefix + currentUrl.pathname.slice(editorPrefix.length), {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editorData)
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        refreshMessage("data successfully updated")
                    } else {
                        refreshMessage("Error occurs during operation", "error")
                    }
                    if (downloadResponse.prop('checked')) {
                        downloadJson(await response.json())
                    }
                })
        }
    })

    deleteButton.click(async function() {
        if (confirm('Please confirm before delete')) {
            fetch(apiPrefix + currentUrl.pathname.slice(editorPrefix.length), { method: 'DELETE' })
                .then(async (response) => {
                    if (response.status === 200) {
                        alert("data successfully deleted")
                        if (downloadResponse.prop('checked')) {
                            downloadJson(await response.json())
                        }
                        let pathChain = currentUrl.pathname.split("/")
                        pathChain.splice(pathChain.length - 2, 2)
                        window.location.replace(pathChain.join("/"))
                    } else {
                        refreshMessage("Error occurs during operation", "error")
                        if (downloadResponse.prop('checked')) {
                            downloadJson(await response.json())
                        }
                    }
                })
        }
    })

    executeButton.click(async function() {
        let editorData = jsoneditor.getValue()
        if ( editorData.constructor === Object ) {
            fetch(apiPrefix + currentUrl.pathname.slice(editorPrefix.length), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editorData)
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response.headers.has('Content-Disposition') && response.headers.get('Content-Disposition').includes("filename=")) {
                            // It is a file response, so we start to download the file
                            let fileName = response.headers.get('Content-Disposition').split("filename=")[1]
                            let fileContent = await response.blob()
                            downloadBlob(fileName, fileContent)
                        } else {
                            // It is a json response
                            refreshMessage("Action successfully accomplished")
                            if (downloadResponse.prop('checked')) {
                                downloadJson(await response.json())
                            }
                        }
                    } else {
                        refreshMessage("Error occurs during action", "error")
                        if (downloadResponse.prop('checked')) {
                            downloadJson(await response.json())
                        }
                    }
                })
        }
    })

    data.options = defaultOptions;
    pageMessage.hide()
    if (currentUrl.pathname.split("/").join("") === editorPrefix.split("/").join("")) { // Index
        collectionButton.hide()
        documentButton.hide()
        actionButton.hide()
        downloadResponse.hide()
    } else if (currentUrl.pathname.includes("/_/")) { // Action level
        collectionButton.hide()
        documentButton.hide()
        await refreshJsoneditor(schemaActionUrl, null, false, false);
    } else if (currentUrl.pathname.split("/").length > 3) {  // Document level
        actionButton.hide()
        collectionButton.hide()
        await refreshJsoneditor(schemaEditUrl, apiEndpoint, false, false);
    } else { // Collection level
        // Collection level
        actionButton.hide()
        documentButton.hide()
        if (currentUrl.search) {
            await refreshJsoneditor(schemaDisplayUrl, apiEndpoint, true);
        } else {
            await refreshJsoneditor(schemaSearchUrl, null, false, false);
        }
    }
});
