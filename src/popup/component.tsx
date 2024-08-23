import { ledgerUSBVendorId } from "@ledgerhq/devices";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { listen } from "@ledgerhq/logs";
import IronfishApp, {
	IronfishKeys,
	ResponseAddress,
} from "@zondax/ledger-ironfish";
import React from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";

export const hasConnectedLedgerDevice = async () => {
	const navigator = window.navigator;
	console.log("hid" in navigator);
	const devices = await (navigator as any).hid.getDevices();
	console.log("Devices:", devices);
	return (
		devices.filter((device: any) => device.vendorId === ledgerUSBVendorId)
			.length > 0
	);
};

export const hasUsbDevice = async () => {
	const navigator = window.navigator;
	console.log("usb" in navigator);
	const devices = await (navigator as any).usb.getDevices();
	console.log("Devices:", devices);
	return devices.length > 0;
};

// Add this function to open the popup as a webpage
const openAsWebpage = () => {
	const url = browser.runtime.getURL("popup.html");
	browser.tabs.create({ url });
};

export function Popup() {
	const [publicAddress, setPublicAddress] = React.useState("");
	// Sends the `popupMounted` event
	React.useEffect(() => {
		browser.runtime.sendMessage({ popupMounted: true });
	}, []);

	const initLedger = async () => {
		//   try {
		listen((log) => console.log(log));
		console.log("await TransportWebHid.isSupported()");
		console.log(await TransportWebHid.isSupported());
		await hasUsbDevice();
		const result = await hasConnectedLedgerDevice();
		console.log("Ledger device connected:", result);
		const transport = await TransportWebHid.create();
		console.log("Ledger transport created:", transport);

		const PATH = "m/44'/1338'/0";

		const app = new IronfishApp(transport);

		const appInfo = await app.appInfo();
		console.log(appInfo);

		const response: ResponseAddress = await app.retrieveKeys(
			PATH,
			IronfishKeys.PublicAddress,
			false,
		);

		if (!response.publicAddress) {
			console.log(`No public address returned.`);
			console.log(response.returnCode.toString());
			throw new Error(response.errorMessage);
		}

		setPublicAddress(response.publicAddress.toString("hex"));

		response.publicAddress.toString("hex");
	};

	// Renders the component tree
	return (
		<div className={css.popupContainer}>
			<div className="mx-4 my-4">

				<button
					className="mt-4 ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
					onClick={openAsWebpage}
				>
					1. Open as Webpage
				</button>

				<button
					className="mt-4 ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => {
						initLedger();
					}}
				>
					2. Initialize Ledger
				</button>

				{publicAddress && (
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Public Address
						</label>
						<div className="p-3 bg-gray-100 rounded-md border border-gray-300">
							<p className="text-md font-medium break-all">
								{publicAddress}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
