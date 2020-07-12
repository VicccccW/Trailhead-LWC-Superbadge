// imports
// import getBoatTypes from the BoatDataService => getBoatTypes method';
import { LightningElement, wire, track } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {

  //no need to use track as since new release, all properties are reactive
  //but in order to pass the chanllenge, still need to declare as @track
  @track searchOptions;

  selectedBoatTypeId = '';

  // Private
  @track error = undefined;

  // Wire a custom Apex method
  @wire(getBoatTypes)
  boatTypes({ error, data }) {
    if (data) {
      // console.log(data);
      this.searchOptions = data.map(type => ({
        label: type.Name,
        value: type.Id
      }));
      // console.log(this.searchOptions);

      //The unshift() method adds new items to the beginning of an array, 
      //and returns the new length. 
      //Note: This method changes the length of an array. 
      //Tip: To add new items at the end of an array, use the push() method.
      this.searchOptions.unshift({ label: 'All Types', value: '' });
    } else if (error) {
      this.searchOptions = undefined;
      this.error = error;
    }
  }

  // Fires event that the search option has changed.
  // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
  handleSearchOptionChange(event) {
    // event.preventDefault();

    // Create the const searchEvent
    // searchEvent must be the new custom event search
    this.selectedBoatTypeId = event.target.value;

    const searchEvent = new CustomEvent('search', {
      detail: {
        boatTypeId: this.selectedBoatTypeId
      }
    });
    this.dispatchEvent(searchEvent);
  }
}