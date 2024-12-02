public class Main {
    public static void main(String[] args) {
        DatabaseHelper.createTable();  

        
        DatabaseHelper.addUser("admin", "admin123", "Admin");
        DatabaseHelper.addUser("user1", "user123", "User");

        
        System.out.println("Users in the system:");
        DatabaseHelper.readUsers();
    }
}
