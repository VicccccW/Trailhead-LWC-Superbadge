// imports
import { LightningElement, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

export default class BoatSearch extends LightningElement {
  // isLoading = false;
  selectedBoatTypeId;

  // // Handles loading event
  // handleLoading() { }

  // // Handles done loading event
  // handleDoneLoading() { }

  // Handles search boat event
  // This custom event comes from the form
  searchBoats(event) {
    this.selectedBoatTypeId = event.detail.boatTypeId;
  }

  @wire(getBoats, { boatTypeId: '$selectedBoatTypeId' })
  boatsByType;


  createNewBoat() {
    console.log('in boatSearch createNewBoat');
  }
}
