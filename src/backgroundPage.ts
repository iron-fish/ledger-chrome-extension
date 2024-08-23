import browser from "webextension-polyfill";

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
    // Log statement if request.popupMounted is true
    // NOTE: this request is sent in `popup/component.tsx`
    if (request.popupMounted) {
        console.log("backgroundPage notified that Popup.tsx has mounted.");
    }
});


// import TransportWebHid from '@ledgerhq/hw-transport-webhid';

// console.log('This is the background page.');

// const initLedger = async () => {
//   try {
//     const transport = await TransportWebHid.create(3000, 3000);
//     console.log('Ledger transport created:', transport);
//     return { success: true, transport };
//   } catch (error) {
//     console.error('Error initializing Ledger:', error);
//     return { success: false, error: error.message };
//   }
// };