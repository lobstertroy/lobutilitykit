export default async function tempTemp(tempId, livekey, testkey) {
  //fetch temp info from lob API (live)
  let liveTemp = await fetch(`https://api.lob.com/v1/templates/${tempId}`, {
    method: 'get',
    headers: {
      'Authorization': `Basic ${btoa(livekey + ":")}`,
      'Lob-Version': "2020-02-11"
    }
  }).then(resp => resp.json());

  let eng = liveTemp.published_version.engine;
  let html = liveTemp.published_version.html;
  let req_vars = eng === 'handlebars' ? liveTemp.published_version.required_vars : [];


  //send temp info to lob API (test)
  const formData = new FormData();
  formData.append("html", html);
  formData.append("engine", eng);
  if (req_vars.length > 0) formData.append("required_vars", req_vars);
  let testTemp = await fetch(`https://api.lob.com/v1/templates`, {
    method: 'post',
    headers: {
      'Authorization': `Basic ${btoa(testkey + ":")}`,
      'Lob-Version': "2020-02-11"
    },
    body: formData
  }).then(resp => resp.json());
  //retrieve temp (test) ID from response

  //use temp(test) ID in test piece
  return testTemp.id;
}
