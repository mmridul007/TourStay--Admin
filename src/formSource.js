export const userInputs = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "username",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "example@gmail.com",
  },
  {
    id: "phone",
    label: "Phone",
    type: "text",
    placeholder: "01712345678",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
  },
  // {
  //   id: "country",
  //   label: "Country",
  //   type: "text",
  //   placeholder: "Your Country",
  // },
  {
    id: "city",
    label: "City",
    type: "text",
    placeholder: "Dhaka",
    required: false,
  },
  {
    id: "isAdmin",
    label: "Admin Privileges",
    type: "checkbox",
    placeholder: "",
    required: false,
    fullWidth: true,
  },
];

export const hotelInputs = [
  {
    id: "name",
    label: "Name",
    type: "text",
    placeholder: "Hotel name",
  },
  {
    id: "type",
    label: "type",
    type: "text",
    placeholder: "hotel",
  },
  {
    id: "city",
    label: "City",
    type: "text",
    placeholder: "city name",
  },
  {
    id: "address",
    label: "Address",
    type: "text",
    placeholder: "Hotel address",
  },
  {
    id: "distance",
    label: "Distance from City Center",
    type: "text",
    placeholder: "Enter distance",
  },
  {
    id: "title",
    label: "Title",
    type: "text",
    placeholder: "Hotel Title",
  },
  {
    id: "desc",
    label: "Description",
    type: "text",
    placeholder: "Hotel Description",
  },
  {
    id: "cheapestPrice",
    label: "Price",
    type: "text",
    placeholder: "Enter hotel price",
  },
];

export const roomInputs = [
  {
    id: "title",
    label: "Title",
    type: "text",
    placeholder: "Room Title",
  },
  {
    id: "desc",
    label: "Description",
    type: "text",
    placeholder: "Room Description",
  },
  {
    id: "price",
    label: "Price",
    type: "number",
    placeholder: "Room Price",
  },
  {
    id: "maxPeople",
    label: "Max People",
    type: "number",
    placeholder: "Enter maxPeople Number",
  },
];
