import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MD5Test {
    public static void main(String[] args) {
        String password = "Lsz180410-0512";
        String md5Hash = getMD5Hash(password);
        System.out.println("MD5 hash of '" + password + "': " + md5Hash);
        System.out.println("Expected hash: 7ed6ec3dd68fc15e9d4e5e8ec1ec3e57");
        System.out.println("Match: " + md5Hash.equals("7ed6ec3dd68fc15e9d4e5e8ec1ec3e57"));
    }

    private static String getMD5Hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }
}