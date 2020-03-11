var device;
const applicationServerPublicKey = 'BAqjaDzlwzIZuTetsdnXmooGGpJPriK-ffvieZfmTar8_j4OQiBqrBDrJphUIxjuLsf49RF_PJ5GhOShxIna09I';
let isSubscribed = false;
let swRegistration = null;

function setContentInfo() {    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('/lib/js/serviceWorkers.js?id=34')
            .then(function (swReg) {
                console.log('Service Worker is registered', swReg);

                swRegistration = swReg;
                initializeUI();
            })
            .catch(function (error) {
                console.error('Service Worker Error', error);
            });
    } else {
        console.warn('Push messaging is not supported');
        $("#cmdPushButton").text("Push Not Supported");
    }
    
}

function initializeUI()
{
    $("#cmdPushButton").click(function () {
        if (isSubscribed) {
            unsubscribeUser();            
        } else {
            subscribeUser();            
        }
    });
    const previousDetails = getDetails();
    if (previousDetails)
    {
        $("#PushPayload").val(previousDetails.pushpayload);
    }
    
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);
            
            $("#cmdSendPushButton").click(function () { SendPush(subscription) });

            if (isSubscribed) {
                console.log('User is subscribed.'); 
                $("#PushSend").show();
            } else {
                console.log('User is NOT subscribed.');  
                $("#PushInfo").show();
            }
            updateBtn();
        });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        $("#cmdPushButton").text("Push Messaging Blocked");
        $("#cmdPushButton").prop('disabled', true);        
        //updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        $("#cmdPushButton").text("Disable Push Messaging");
        $("#PushSend").show();
        $("#PushInfo").hide();
    } else {
        $("#cmdPushButton").text("Enable Push Messaging");
        $("#PushSend").hide();
        $("#PushInfo").show();
    }
    $("#cmdPushButton").prop('disabled', false);
}

function SendPush(Subscription)
{
    saveDetails({
        subscription: Subscription,
        pushpayload: $("#PushPayload").val()
    });    

    var ObjSubscription = JSON.parse(JSON.stringify(Subscription));
    var _ObjpushTransferClass = {};
    _ObjpushTransferClass.PayLoad = $("#PushPayload").val();
    _ObjpushTransferClass.Endpoint = ObjSubscription.endpoint;
    _ObjpushTransferClass.P256DH = ObjSubscription.keys.p256dh;
    _ObjpushTransferClass.Auth = ObjSubscription.keys.auth;
    console.log(Subscription);
    //console.log(JSON.stringify(Subscription.keys.p256dh));
    

    
    var _azAjaxOptions =
    {
        azAjaxUrl: "/api/push/push",
        azAjaxObjToSend: _ObjpushTransferClass
    };

    new AZAjax(_azAjaxOptions).done(function (data) {
        
        console.log(data);
        
    });
    
}

function getDetails() {
    const Details = window.localStorage.getItem('PushDetails');
    try {
        if (Details) {
            return JSON.parse(Details);
        }
    } catch (err) {
        // NOOP
    }
    return null;
}

function saveDetails(details) {
    window.localStorage.setItem('PushDetails',
        JSON.stringify(details));
}

function subscribeUser()
{
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed.');

            //updateSubscriptionOnServer(subscription);
            console.log(JSON.stringify(subscription));

            isSubscribed = true;

            updateBtn();
        })
        .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });    
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function (error) {
            console.log('Error unsubscribing', error);
        })
        .then(function () {
            //updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}

function urlB64ToUint8Array(base64String)
{
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}