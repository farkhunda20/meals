const meals = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const poupClose = document.querySelector(".close-popup");
const mealInfoEl = document.querySelector(".meal-info");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  const respData = await resp.json();
  const randomMeal = respData.meals[0];
  // console.log(randomMea l);
  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();

  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  console.log(meals);

  return meals;
}

// const getRandomMeal = (resource) => {
//   return new Promise((resolve, reject) => {
//     const request = new XMLHttpRequest();
//     request.addEventListener("readystatechange", () => {
//       if (request.readyState === 4 && request.status === 200) {
//         let data = JSON.parse(request.responseText);

//         resolve(data);
//       } else if (request.status === 404) {
//         reject("error occured");
//       }
//     });
//     // https://jsonplaceholder.typicode.com/todos/
//     request.open("GET", resource);
//     request.send();
//   });
// };

// getRandomMeal("https://www.themealdb.com/api/json/v1/1/random.php").then(
//   (data) => {
//     console.log("promise 1 resolved", data.meals[0]);
//   }
// );

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");

  console.log(mealData);

  meal.innerHTML = `
          <div class="meal-header">
           ${random ? ` <span class="random"> Random recipe </span>` : ``}
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}" />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal} </h4>
            <button class="fav-btn">
              <i class="fas fa-heart"></i>
            </button>
          </div>
       `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealsFromLs(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });
  meals.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealfromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealsFromLs(mealId) {
  const mealIds = getMealfromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealfromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  //clean the conatainer
  favoriteContainer.innerHTML = "";

  const mealIds = getMealfromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    const meal = await getMealById(mealId);

    addMealtoFav(meal);
  }
}

function addMealtoFav(mealData) {
  const favmeal = document.createElement("li");

  favmeal.innerHTML = `
         
            <img id = "fav-img"
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}" />
              <span>${mealData.strMeal}</span>
            <button class="clear"><i class="fas fa-window-close"></i></button>
         
       `;

  const btn = favmeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealsFromLs(mealData.idMeal);

    fetchFavMeals();
  });

  favmeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favoriteContainer.appendChild(favmeal);
}

searchBtn.addEventListener("click", async () => {
  const searchInput = searchTerm.value;

  // console.log(await getMealBySearch(searchInput));
  const meals = await getMealBySearch(searchInput);
  meals.innerHTML = "";
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

poupClose.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  const mealEl = document.createElement("div");

  const ingredients = [];
  // get ingridient and measure
  for (let i = 0; i < 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]}/ ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = ` 
  
  
   <h2 class="meal-title">${mealData.strMeal} </h2>
          <img
            src="${mealData.strMealThumb}"
            alt="" />

          <p>
             ${mealData.strInstructions}
           </p>

        <h3>Ingredients: </h3>
          <ul>
            ${ingredients
              .map(
                (ing) => `
              <li>${ing}</li>
            `
              )
              .join("")}
          </ul>
  `;
  mealInfoEl.appendChild(mealEl);
  mealPopup.classList.remove("hidden");
}
