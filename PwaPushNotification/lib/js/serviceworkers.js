self.addEventListener('push', function (event)
{
    //event.self.skipwaiting();

    console.log(`[PUSH_kaa] Push had this data: "${event.data.json()}"`);
    var objData = JSON.parse(event.data.json());
    console.log(objData.title);

    self.registration.showNotification(objData.title, {
        body: 'Yay it works!',
    });
});