1. 

```js
const data = [
  { value: "1", label: "One" },
  { value: "2", label: "Two" },
  { value: "3", label: "Three" },
];

const values = data.reduce((values, { value }) => {
  values.push(value);
  return values;
}, []);
```

2. 

```js
async function getIndexes() {
   return await fetch('https://api.coingecko.com/api/v3/indexes').then(res => res.json());
}

// Cette fonction ne sert qu'à wrapper le getIndexes() dans un catch pour re-throw une exception,
// autant tout faire dans le getIndexes() quitte à rendre l'exception plus lisible que celle de base
async function analyzeIndexes() {
   const indexes = await getIndexes().catch(_ => {
      throw new Error('Unable to fetch indexes');
   });
   return indexes;
}
```

Modifications:

```js
async function getIndexes() {
   return await fetch('https://api.coingecko.com/api/v3/indexes').then(res => res.json()).catch(_ => {
      throw new Error('Unable to fetch indexes');
   });
}
```

3. 

```js
let state;
const user = getUser();
if (user) {
   const project = getProject(user.id);
   state = {
      user,
      project
   };
} else { // Pour économie de lignes de code (et donc de clarté), ce else n'est pas utile
   state = {
      user: null,
      project: null
   };
}
ctx.body = state;
```

Modifications:

```js
let state = {
  user: null,
  project: null
};
const user = getUser();
if (user) {
   const project = getProject(user.id);
   state = {
      user,
      project
   };
}
ctx.body = state;
```

4. 

```js
function getQueryProvider() {
  const url = window.location.href;
  const [_, provider] = url.match(/provider=([^&]*)/);
  if (provider) {
     return provider;
  }
  return; // Pas utile
}
```

5. 

```js
function getParagraphTexts() {
   const texts = [];
   document.querySelectorAll("p").forEach(p => {
      texts.push(p);
   });
   return texts;
}
```

6. 

```js
function Employee({ id }) {
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const [employee, setEmployee] = useState({});

   useEffect(() => {
      getEmployee(id)
         .then(employee => {
            setEmployee(employee);
            setLoading(false); // À mettre dans un block finally
         })
         .catch(_ => {
            setError('Unable to fetch employee');
            setLoading(false); // À mettre dans un block finally
         });
   }, [id]);

   if (error) {
      return <Error />;
   }

   if (loading) {
      return <Loading />;
   }

   return (
      <Table>
         <Row>
            <Cell>{employee.firstName}</Cell>
            <Cell>{employee.lastName}</Cell>
            <Cell>{employee.position}</Cell>
            <Cell>{employee.project}</Cell>
            <Cell>{employee.salary}</Cell>
            <Cell>{employee.yearHired}</Cell>
            <Cell>{employee.wololo}</Cell>
         </Row>
      </Table>
   );
}
```

7. 

```js
async function getFilledIndexes() {
   try {
      const filledIndexes = [];
      const indexes = await getIndexes();
      const status = await getStatus();
      const usersId = await getUsersId();
      
      for (let index of indexes) {
         if (index.status === status.filled && usersId.includes(index.userId)) {
            filledIndexes.push(index);
         }
      }
      return filledIndexes;
   } catch(_) {
      // Gestion d'erreurs un peu large, peut-être à affiner en fonction des différentes qui peuvent se produire
      throw new Error ('Unable to get indexes'); 
   }
}
```

8. 

```js
// De ce que je comprends: relation one to one entre user et project, donc un user ne peut avoir qu'un projet
// Pourquoi donc lier les settings au projet plutôt qu'à l'user, surtout vu le nom de la fonction
function getUserSettings(user) {
   if (user) {
      const project = getProject(user.id);
      if (project) {
         const settings = getSettings(project.id);
         if (settings) {
            return settings;
         }
      }
   }
   return {};
}
```
