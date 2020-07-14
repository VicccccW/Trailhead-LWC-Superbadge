import { LightningElement, wire, api, track } from 'lwc';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { MessageContext, publish } from "lightning/messageService";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLS = [
  { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
  { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
  { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
  { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
];

export default class BoatSearchResults extends LightningElement {
  @track selectedBoatId = '';
  columns = COLS;
  @track boatTypeId = '';
  boats;
  isLoading = false;
  @track draftValues = [];

  // wired message context
  // create message context for the component
  @wire(MessageContext)
  messageContext;

  // call apex method to get boats data or error message
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boats = result;
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  // parent component boatSearch will pass boatTypeId data
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    return refreshApex(this.boats);
  }

  // this function must update selectedBoatId and call sendMessageService\
  // handler for onboatselect event
  updateSelectedTile(event) {
    //child tile compoment sent the selected boat id
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    const message = {
      recordId: boatId
    };

    publish(this.messageContext, BOATMC, message);
  }

  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);

    // the inline editing save event will have draftValues 
    // slice method retruns a shallow copy of an array
    const recordInputs = event.detail.draftValues.slice().map(draft => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    // update boat record
    // returns a promise array for async update handling
    const promises = recordInputs.map(recordInput => updateRecord(recordInput));

    Promise.all(promises)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: 'Ship It!',
            variant: 'success'
          })
        );

        // Clear all draft values
        this.draftValues = [];

        // Display fresh data in the datatable
        this.refresh();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error',
            message: error.body.message,
            variant: 'error'
          })
        );
      })
      .finally(() => {
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
      });
  }

  //Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading', { detail: isLoading }));
    } else {
      this.dispatchEvent(new CustomEvent('doneloading', { detail: isLoading }));
    }
  }
}