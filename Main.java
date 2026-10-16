import java.util.Scanner;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);
    private static final PetMachine petMachine = new PetMachine();

    public static void main(String[] args) {
        int option = -1;
        do {
            System.out.println("Escolha uma das seguintes opções:");
            System.out.println("1: Dar banho no Pet");
            System.out.println("2: Abastecer a máquina com Água");
            System.out.println("3: Abastecer a máquina com Shampoo");
            System.out.println("4: Verificar o nível de Água");
            System.out.println("5: Verificar o nível de Shampoo");
            System.out.println("6: Verificar se tem Pet na máquina");
            System.out.println("7: Colocar Pet na máquina");
            System.out.println("8: Retirar Pet da máquina");
            System.out.println("9: Limpar a máquina");
            System.out.println("0: Sair");
            option = readOption();
            switch (option) {
                case 1 -> petMachine.takeAShowerInAPet();
                case 2 -> petMachine.addWater();
                case 3 -> petMachine.addShampoo();
                case 4 -> verifyWater();
                case 5 -> verifyShampoo();
                case 6 -> checkIfHasPetInMachine();
                case 7 -> setPetInPetMachine();
                case 8 -> petMachine.removePet();
                case 9 -> petMachine.wash();
                case 0 -> System.out.println("Saindo...");
                default -> System.out.println("Opção inválida");
            }
        } while (option != 0);
    }

    private static int readOption() {
        try {
            return Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private static void verifyWater() {
        System.out.println("A máquina está no momento com " + petMachine.getWater() + " litro(s) de água");
    }

    private static void verifyShampoo() {
        System.out.println("A máquina está no momento com " + petMachine.getShampoo() + " litro(s) de Shampoo");
    }

    private static void checkIfHasPetInMachine() {
        System.out.println(petMachine.hasPet() ? "Tem pet na máquina" : "Não tem Pet na máquina");
    }

    private static void setPetInPetMachine() {
        String name = "";
        while (name.isBlank()) {
            System.out.print("Informe o nome do Pet: ");
            name = scanner.nextLine().trim();
        }
        petMachine.setPet(new Pet(name));
    }
}