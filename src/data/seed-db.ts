const { DocumentStore } = require("ravendb");
const mockData = require("./pitch-spec.json");

const store = new DocumentStore(process.env.DB_HOST, process.env.DB_NAME);
store.initialize();

(async function seedDb() {
  const session = store.openSession();

  for (let i = 0; i < 10; i++) {
    await session.store(
      productionLikeDataInTermsOfObjects(),
      `Performance/${i}`
    );
  }
  await session.saveChanges();

  await store.dispose();
})();

function productionLikeDataInTermsOfObjects() {
  // NOTE: adds some more props to the document to emphasize the problem as the object is not very large
  const data = Object.assign({}, mockData);
  for (let i = 0; i < 10; i++) {
    data[`pages${i + 1}`] = mockData.pages;
  }
  return data;
}
