

//History (From-Others)
app.get('/from-others', requireAuth, function (req, res) {
  let user_id = req.user_id;
    const selectDocumentsSql =`
      SELECT documents.document_id, documents.name, documents.description
      FROM documents
      INNER JOIN signature ON documents.document_id = signature.document_id
      WHERE signature.user_id = ${user_id}
    `;
    db.query(selectDocumentsSql, (err, documentResult) => {
      if (err) throw err;
        res.render('from-others', {
          documents: documentResult,
          moment: moment,
          title: 'from others',
          layout: 'layouts/main'
    });
  });
});

app.get('/download/:document_id', requireAuth, (req, res) => {
  const document_id = req.params.document_id;
    const docSql = 'SELECT * FROM documents WHERE document_id = ?';
    db.query(docSql, [document_id], function(err, docResult) {
      if (err) throw err;
      if (docResult.length === 0) {
        res.status(404).send('Doc not found');
        return;
      }

      const doc = docResult[0];
      const filePath = `uploads/${doc.filename}`;

      res.download(filePath, doc.file_name, function(err) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal server error');
        }
    });
  });
});

// Profile
app.get('/profil', requireAuth, function (req, res) {
  let user_id = req.user_id;
  const selectSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectSql, (err,userResult)=>{
    if (err) throw err;
      res.render('profil',{
        user: userResult[0],
        title:'Profil',
        layout:'layouts/main'
      })
  })
})

// Profile (Update-Profile)
app.post('/update-profil', upload.single('sign_img'), requireAuth, (req, res) => {
  let user_id = req.user_id;
  const { email } = req.body;
  const signImg = req.file ? req.file.filename : null;

  let updateQuery = 'UPDATE users SET email=?';
  let values = [email];

  if (signImg) {
    updateQuery += ', sign_img=?';
    values.push(signImg);
  }

  updateQuery += ' WHERE user_id=?';
  values.push(user_id);

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('updated!');

    // Copy file to img directory
    if (signImg) {
      const signImgSource = path.join(__dirname, 'uploads', signImg);
      const signImgDestination = path.join(__dirname, 'assets', 'img', signImg);
      fs.copyFileSync(signImgSource, signImgDestination);
    }
    console.log('profil updated!')
    res.redirect('/profil');
  });
});

// Profile (Change-Password)
app.post('/change-password', requireAuth, (req, res) => {
  const userId = req.user_id;
  const { password, newPassword } = req.body;

  const sql = 'SELECT password FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {console.log('internal error!')}

    const hashedPassword = result[0].password;
    bcrypt.compare(password, hashedPassword, (error, isMatch) => {
      if (error) {console.log('internal error!')}

      if (isMatch) {
        bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
          if (err) {{console.log('internal error!')}}

          const updateSql = 'UPDATE users SET password = ? WHERE user_id = ?';
          const values = [hashedNewPassword, userId];
          db.query(updateSql, values , (err, result) => {
            if (err) {{console.log('internal error!')}}
            console.log('password changed!');
            res.redirect('/profil');
          });
        });
      } else {
        console.log('Invalid current password');
        res.redirect('/profil');
      }
    });
  });
});


