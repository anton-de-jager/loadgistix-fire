import * as buildUrl from "build-url";

interface Config {
    merchant_id: string;
    merchant_key: string;
    production: boolean;
}

interface PaymentDetails {
    amount: string;
    item_name: string;
    item_description?: string;
    currency?: string;
    payment_method?: string;
    name_first?: string;
    name_last?: string;
    email_address?: string;
    cell_number?: string;
}

interface ReferenceDetails {
    m_payment_id: string;
    custom_str1: string;
    custom_str2: string;
}

interface RedirectUrls {
    cancel_url?: string;
    return_url?: string;
    notify_url?: string;
}

export class PayFastAPI {

    merchant_id: string;
    merchant_key: string;
    private url: string;
    payment_details!: PaymentDetails;
    reference_details!: ReferenceDetails;
    redirect_urls: RedirectUrls;

    constructor({ merchant_id, merchant_key, production }: Config) {
        this.merchant_id = merchant_id;
        this.merchant_key = merchant_key;
        this.url = `https://${production ? "www.payfast" : "sandbox.payfast"}.co.za/eng/process`;

        // this.payment_details = {
        //     amount: null,
        //     item_name: null
        // }

        // this.reference_details = {
        //     m_payment_id: null,
        //     custom_str1: null,
        //     custom_str2: null
        // }

        this.redirect_urls = {}
    }

    addPaymentDetails(payment_details: PaymentDetails): void {
        this.payment_details.amount = payment_details.amount;
        this.payment_details.item_name = payment_details.item_name;
        this.payment_details.item_description = payment_details.item_description;
        this.payment_details.currency = payment_details.currency;
        this.payment_details.payment_method = payment_details.payment_method;
        this.payment_details.name_first = payment_details.name_first;
        this.payment_details.name_last = payment_details.name_last;
        this.payment_details.email_address = payment_details.email_address;
        this.payment_details.cell_number = payment_details.cell_number;
    }

    addReferenceDetails(reference_details: ReferenceDetails): void {
        this.reference_details.m_payment_id = reference_details.m_payment_id;
        this.reference_details.custom_str1 = reference_details.custom_str1;
        this.reference_details.custom_str2 = reference_details.custom_str2;
    }

    cancelURL(url: string): void {
        this.redirect_urls.cancel_url = url;
    }

    returnURL(url: string): void {
        this.redirect_urls.return_url = url;
    }

    notifyURL(url: string): void {
        this.redirect_urls.notify_url = url;
    }

    generateURL(): string {
        // @ts-ignore
        return buildUrl(this.url, {
            queryParams: {
                merchant_id: this.merchant_id,
                merchant_key: this.merchant_key,
                ...this.payment_details,
                ...this.redirect_urls,
                ...this.reference_details
            }
        });
    }

}