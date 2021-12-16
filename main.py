from myapp import create_app
# from myapp import db
# from myapp.models import CurrentUser

app = create_app()


if __name__=='__main__':
    # with app.app_context():
    #     db.create_all()
    #     print("DAtabase amde su")
    app.run(debug=True, port=5000)