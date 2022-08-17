/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import mockStore from "../__mocks__/store.js";

window.alert = jest.fn();
jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );

  describe("When I am on a newbill and the date, ttc and attached file fields are empty", () => {
    test("Then the newbill stay on screen ", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;

      const date = screen.getByTestId("datepicker");
      expect(date.value).toBe("");

      const ttc = screen.getByTestId("amount");
      expect(ttc.value).toBe("");

      const fichier = screen.getByTestId("file");
      expect(fichier.value).toBe("");

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const envoiNewBill = jest.fn((e) => e.preventDefault());
      formNewBill.addEventListener("submit", envoiNewBill);
      fireEvent.submit(formNewBill);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When i download the attached file in the correct format ", () => {
    test("Then the newbill is sent", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window,
        localStorage,
      });

      const chargeFichier = jest.fn((e) => newBill.handleChangeFile(e));

      const fichier = screen.getByTestId("file");
      const testFormat = new File(["c'est un test"], "test.jpg", {
        type: "image/jpg",
      });
      fichier.addEventListener("change", chargeFichier);
      fireEvent.change(fichier, { target: { files: [testFormat] } });

      expect(chargeFichier).toHaveBeenCalled();
      expect(fichier.files[0]).toStrictEqual(testFormat);

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const envoiNewBill = jest.fn((e) => newBill.handleSubmit(e));
      formNewBill.addEventListener("submit", envoiNewBill);
      fireEvent.submit(formNewBill);
      expect(envoiNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
  
  describe("When i download the attached file in the wrong format", () => {
    test("Then i stay on the newbill and a message appears", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window,
        localStorage,
      });
      const chargeFichier = jest.fn((e) => newBill.handleChangeFile(e));
      const fichier = screen.getByTestId("file");
      const testFormat = new File(["c'est un test"], {
        type: "document/txt",
      });
      fichier.addEventListener("change", chargeFichier);
      fireEvent.change(fichier, { target: { files: [testFormat] } });

      expect(chargeFichier).toHaveBeenCalled();
      expect(window.alert).toBeTruthy();
    });
  });


  describe("When i fill out the form and i validate it with the send button", () => {
    test("Then the form must be sent to the invoices page", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBillEnCours = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const envoiNewBill = jest.fn((e) => newBillEnCours.handleSubmit(e));
      formNewBill.addEventListener("submit", envoiNewBill);
      fireEvent.submit(formNewBill);
      expect(envoiNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});
