// API controller - soon :) https://ndb.nal.usda.gov/fdc-app.html#/
// const APICtrl = (function () {
//   const api = "";

//   return {
//     get: async function (input) {
//       const answer = await fetch(
//         `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api}&query=${input}&requireAllWords=true&`
//       );
//       const data = await answer.json();
//       return data;
//     },
//   };
// })();

// Storage Controller
const LSCtrl = (function () {
  let LSItems;
  if (!localStorage.getItem("item")) {
    LSItems = null;
    console.log("LS is empty");
  } else {
    LSItems = JSON.parse(localStorage.getItem("item"));
  }
  return {
    getLS: function () {
      LSItems = JSON.parse(localStorage.getItem("item"));
      return LSItems;
    },
    setLS: function (data) {
      LSItems = JSON.stringify(data);
      localStorage.setItem("item", LSItems);
    },
    clearLS: function () {
      LSItems = null;
      localStorage.removeItem("item");
    },
  };
})();

// Item Controller
const ItemCtrl = (function (LSCtrl) {
  const Item = function (id, name, calories) {
    this.id = id;
    this.name = name;
    this.calories = calories;
  };
  let data;
  if (!LSCtrl.getLS()) {
    data = {
      items: [],
      currentItem: null,
      totalCalories: 0,
    };
  } else {
    data = LSCtrl.getLS();
  }

  return {
    getItems: function () {
      return data.items;
    },
    addItem: function (item) {
      id = data.items.length;
      calories = parseInt(item.calories);
      newItem = new Item(id, item.name, calories);

      data.items.push(newItem);
      LSCtrl.setLS(data);
      return newItem;
    },
    chooseCurrentItem: function (id) {
      if (id === null) {
        data.currentItem = null;
      } else {
        console.log(id);
        data.currentItem = this.getItems().find((item) => item.id == id);
        console.log(data.currentItem);
      }
      LSCtrl.setLS(data);
      return data.currentItem;
    },
    editItem: function (newData) {
      data.currentItem.name = newData.name;
      data.currentItem.calories = newData.calories;
      LSCtrl.setLS(data);
    },
    updateCurrentItem: function () {
      data.items.forEach((item) => {
        if (item.id == data.currentItem.id) {
          item.name = data.currentItem.name;
          item.calories = data.currentItem.calories;
        }
      });
      LSCtrl.setLS(data);
    },

    deleteCurrentItem: function () {
      console.log(data.currentItem.id);
      const index = data.items.find((item, index) => {
        if (item.id == data.currentItem.id) {
          return index;
        }
      });
      data.items.splice(index, 1);
      LSCtrl.setLS(data);
    },
    logData: function () {
      return data;
    },
    getTotalCalories: function () {
      const cal = data.items.reduce((acc, item) => {
        return acc + parseInt(item.calories);
      }, 0);
      return cal;
    },
    deleteItems: function () {
      data.items = [];
      LSCtrl.setLS(data);
    },
  };
})(LSCtrl);
// UI Controller
const UICtrl = (function () {
  const UISelectors = {
    itemList: "#meals-wrapper",
    addBtn: "#add",
    itemNameInput: "#item",
    itemCalories: "#calories",
    clearBtn: "#clear",
    totalCalorories: "#totalCal",
    updateBtn: "#update",
    deleteBtn: "#delete",
    backBtn: "#back",
  };

  return {
    populateItemList: function (items) {
      let html = "";

      items.forEach(function (item) {
        html += `<div class="meal" id="item-${item.id}">
        <p><strong>${item.name}: </strong><i>${item.calories} Calories</i></p>
        <button class="bg-darkpurple btn-edit">Edit</button>
      </div>`;
      });

      // insert divs;
      document.querySelector(UISelectors.itemList).innerHTML = html;
    },
    getItemInput: function () {
      return {
        name: document.querySelector(UISelectors.itemNameInput).value,
        calories: document.querySelector(UISelectors.itemCalories).value,
      };
    },
    getSelectors: function () {
      return UISelectors;
    },
    addItem: function (item) {
      const div = document.createElement("div");
      div.className = "meal";
      div.id = `item-${item.id}`;
      let html = `<p><strong>${item.name}: </strong><i>${item.calories} Calories</i></p>
      <button class="bg-blue btn-edit">Edit</button>`;
      div.innerHTML = html;
      document
        .querySelector(UISelectors.itemList)
        .insertAdjacentElement("beforeend", div);
    },
    showTotalCalories: function (totalCalories) {
      document.querySelector(
        UISelectors.totalCalorories
      ).innerHTML = `Total Calories: ${totalCalories}`;
    },
    clearInput: function () {
      document.querySelector(UISelectors.itemNameInput).value = "";
      document.querySelector(UISelectors.itemCalories).value = "";
    },
    clearAll: function () {
      const itemList = document.querySelector(UISelectors.itemList);
      while (itemList.firstChild) itemList.removeChild(itemList.firstChild);
    },
    showEditField: function (currentItem) {
      document.querySelector(UISelectors.updateBtn).hidden = false;
      document.querySelector(UISelectors.deleteBtn).hidden = false;
      document.querySelector(UISelectors.backBtn).hidden = false;

      document.querySelector(UISelectors.addBtn).hidden = true;

      document.querySelector(UISelectors.itemNameInput).value =
        currentItem.name;
      document.querySelector(UISelectors.itemCalories).value =
        currentItem.calories;

      // Changing buttons' type for using Enter
      document.querySelector(UISelectors.updateBtn).type = "submit";
      document.querySelector(UISelectors.addBtn).type = "button";
      // Hardcoding focus on update for using Enter without manual focusing
      document.querySelector(UISelectors.updateBtn).focus();
    },
    hideEditField: function () {
      document.querySelector(UISelectors.updateBtn).hidden = true;
      document.querySelector(UISelectors.deleteBtn).hidden = true;
      document.querySelector(UISelectors.backBtn).hidden = true;

      document.querySelector(UISelectors.addBtn).hidden = false;

      // Changing buttons' type back
      document.querySelector(UISelectors.updateBtn).type = "button";
      document.querySelector(UISelectors.addBtn).type = "submit";
    },
  };
})();
// App Controller
const AppCtrl = (function (ItemCtrl, UICtrl) {
  let loadEventListeners = function () {
    const UISelectors = UICtrl.getSelectors();

    document
      .querySelector(UISelectors.addBtn)
      .addEventListener("click", itemAddSubmit);

    document.addEventListener("click", itemEdit);

    document
      .querySelector(UISelectors.updateBtn)
      .addEventListener("click", updateMeal);

    document
      .querySelector(UISelectors.deleteBtn)
      .addEventListener("click", deleteItem);

    document
      .querySelector(UISelectors.backBtn)
      .addEventListener("click", cancelEditing);

    document
      .querySelector(UISelectors.clearBtn)
      .addEventListener("click", itemsClear);
  };

  // Add item submit
  const itemAddSubmit = function (e) {
    // get form input from UI Controller
    const input = UICtrl.getItemInput();

    console.log(input);
    if (!input.name || !input.calories) {
      alert("All fields should be filled");
    } else {
      // Add item to data
      const newItem = ItemCtrl.addItem(input);

      // Add item to UI
      UICtrl.addItem(newItem);

      // Get total calories
      const totalCalories = ItemCtrl.getTotalCalories();

      // Add total calories to UI
      UICtrl.showTotalCalories(totalCalories);
      // Clear fields
      UICtrl.clearInput();
    }

    e.preventDefault();
  };

  const itemsClear = function (e) {
    if (confirm("Are you sure?")) {
      ItemCtrl.deleteItems();
      UICtrl.clearAll();
      const totalCalories = ItemCtrl.getTotalCalories();
      UICtrl.showTotalCalories(totalCalories);
      cancelEditing();
    }

    e.preventDefault();
  };

  const itemEdit = function (e) {
    if (e.target.classList.contains("btn-edit")) {
      console.log(e.target.parentElement);
      const id = e.target.parentElement.id.slice(5);
      const currentItem = ItemCtrl.chooseCurrentItem(id);
      UICtrl.showEditField(currentItem);
    }
  };

  const updateMeal = function (e) {
    const newData = UICtrl.getItemInput();
    ItemCtrl.editItem(newData);
    ItemCtrl.updateCurrentItem();
    const items = ItemCtrl.getItems();

    // Get total calories
    const totalCalories = ItemCtrl.getTotalCalories();

    // Add total calories to UI
    UICtrl.showTotalCalories(totalCalories);

    UICtrl.populateItemList(items);
    cancelEditing();
  };

  const deleteItem = function (e) {
    if (confirm("Are you sure?")) {
      ItemCtrl.deleteCurrentItem();
      const items = ItemCtrl.getItems();

      // Get total calories
      const totalCalories = ItemCtrl.getTotalCalories();

      // Add total calories to UI
      UICtrl.showTotalCalories(totalCalories);

      UICtrl.populateItemList(items);
      cancelEditing();
    }
  };

  const cancelEditing = function (e) {
    ItemCtrl.chooseCurrentItem(null);
    UICtrl.clearInput();
    UICtrl.hideEditField();
  };

  return {
    init: function () {
      // Fetch items from data structure
      const items = ItemCtrl.getItems();

      // Populate list with items
      UICtrl.populateItemList(items);

      // Get total calories
      const totalCalories = ItemCtrl.getTotalCalories();

      // Add total calories to UI
      UICtrl.showTotalCalories(totalCalories);

      UICtrl.hideEditField();

      // Load event listenters
      loadEventListeners();
    },
  };
})(ItemCtrl, UICtrl);

AppCtrl.init();
