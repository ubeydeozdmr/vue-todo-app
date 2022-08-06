<script>
import CheckSquare from './icons/check-square.vue';
import Square from './icons/square.vue';
import Pencil from './icons/pencil.vue';
import Trash from './icons/trash.vue';
import PlusCircle from './icons/plus-circle.vue';
import SwitchVertical from './icons/switch-vertical.vue';

export default {
  data() {
    return {
      currentContent: '',
      sort: ['date', 'asc'],
      todos: [],
      // todos: [
      //   {
      //     id: 1,
      //     content: 'Complete the Crema To-Do project quickly and correctly!',
      //     date: '05/08/2022 21:07',
      //     completed: false,
      //   },
      //   {
      //     id: 2,
      //     content: 'Wash the dishes',
      //     date: '05/08/2022 21:48',
      //     completed: false,
      //   },
      //   {
      //     id: 1312342,
      //     content: 'Play Minecraft',
      //     date: '06/08/2022 01:08',
      //     completed: false,
      //   },
      //   {
      //     id: 7838929183,
      //     content: 'Sleep',
      //     date: '06/08/2022 01:09',
      //     completed: false,
      //   },
      // ],
    };
  },
  mounted() {
    // console.log(localStorage.getItem('data'));
    if (localStorage.getItem('data')) {
      this.todos = JSON.parse(localStorage.getItem('data'));
    } else {
      localStorage.setItem('data', JSON.stringify(this.todos));
    }

    if (localStorage.getItem('sort')) {
      this.sort = JSON.parse(localStorage.getItem('sort'));
    } else {
      localStorage.setItem('sort', JSON.stringify(this.sort));
    }

    this.sort[1] === 'asc' ? this.sortTodosByDateAsc() : this.sortTodosByDateDesc();
  },
  methods: {
    /**
     * @param {Number} id - ID property of object in todos array
     * @description - Sets true if the completed property of the selected to-do object is false, false if true.
     */
    toggleStatus(id) {
      this.todos.find(todo => todo.id === id).completed = !this.todos.find(
        todo => todo.id === id
      ).completed;
      this.saveTodo();
    },
    /**
     * @param {String} content - Content of the todo (content input will be taken from user)
     */
    addTodo() {
      if (this.currentContent === '') this.currentContent = 'Blank to-do';
      this.todos.push({
        id: Math.round(Math.random() * 1000000000000),
        content: this.currentContent,
        date: Date.now(),
        completed: false,
      });
      this.currentContent = '';
      this.saveTodo();
    },
    /**
     * @param {Number} id - ID property of the todo
     */
    // editTodo(id) {
    //   this.todos.find(todo => todo.id === id).editMode = !this.todos.find(
    //     todo => todo.id === id
    //   ).editMode;
    // },
    /**
     * @param {Number} id - ID property of the todo
     */
    removeTodo(id) {
      this.todos.splice(
        this.todos.findIndex(todo => {
          return todo.id === id;
        }),
        1
      );
      this.saveTodo();
    },
    sortTodosByDateAsc() {
      this.sort[1] = 'asc';
      this.todos.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
      this.saveSort();
    },
    sortTodosByDateDesc() {
      this.sort[1] = 'desc';
      this.todos.sort((a, b) => parseFloat(b.date) - parseFloat(a.date));
      this.saveSort();
    },
    saveSort() {
      localStorage.setItem('sort', JSON.stringify(this.sort));
    },
    saveTodo() {
      localStorage.setItem('data', JSON.stringify(this.todos));
    },
    myFunc() {
      console.log(this.todos);
    },
  },
  components: { CheckSquare, Square, Pencil, Trash, PlusCircle, SwitchVertical },
};
</script>

<template>
  <div class="p-6 md:p-12 gap-6 md:gap-12 flex flex-col">
    <div>
      <h1 class="text-4xl font-bold">Crema To-Do</h1>
    </div>
    <p v-if="this.todos.length === 0">
      You didn't add any to-do. To create your first to-do, type below then hit enter
      or the + sign.
    </p>
    <div class="w-full flex flex-col gap-3">
      <!-- <div class="w-full flex gap-3 md:gap-6 mb-3">
        <div class="w-1/12 flex justify-center">Status</div>
        <div class="w-9/12">Content</div>
        <div class="w-1/12 flex gap-3 justify-center">Operations</div>
      </div> -->
      <div class="w-full flex gap-3 md:gap-6" v-if="this.todos.length !== 0">
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-9/12"></div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click="
              this.sort[1] === 'asc' ? sortTodosByDateDesc() : sortTodosByDateAsc()
            "
            class="text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <!-- SORT &uarr;&darr; -->
            <SwitchVertical />
          </a>
        </div>
      </div>

      <div class="w-full flex gap-3 md:gap-6" v-for="todo in todos">
        <div class="w-1/12 flex justify-center">
          <a
            href="#"
            v-if="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <CheckSquare />
          </a>
          <a
            href="#"
            v-else="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <Square />
          </a>
        </div>
        <div class="w-9/12">
          <input
            type="text"
            :name="todo.id"
            :id="todo.id"
            v-model="todo.content"
            class="w-full"
            :class="todo.completed ? 'line-through text-gray-500' : ''"
            v-on:change="saveTodo"
          />
          <!-- {{ todo.content }} -->
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <!-- <a href="#" @click="editTodo(todo.id)">
            <Pencil />
          </a> -->
          <a
            href="#"
            @click="removeTodo(todo.id)"
            class="text-gray-300 hover:text-red-500 transition-all duration-200"
          >
            <Trash />
          </a>
        </div>
      </div>

      <div class="w-full flex gap-3 md:gap-6">
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-9/12">
          <input
            type="text"
            name="todoContent"
            id="todoContent"
            class="rounded w-full bg-gray-100 px-3"
            v-model="currentContent"
            v-on:keyup.enter="addTodo"
            placeholder="Add new todo from here..."
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click="addTodo"
            class="text-gray-700 hover:text-green-700 transition-all duration-200"
          >
            <PlusCircle />
          </a>
        </div>
      </div>
    </div>
    <!-- <table class="w-full">
      <thead>
        <th>Status</th>
        <th>Content</th>
        <th class="w-1/12">Operations</th>
      </thead>
      <tbody>
        <tr class="text-center" v-for="todo in todos">
          <td>
            <a
              href="#"
              v-if="todo.completed"
              @click="toggleStatus(todo.id)"
              class="flex justify-center"
            >
              <CheckSquare />
            </a>
            <a
              href="#"
              v-else="todo.completed"
              @click="toggleStatus(todo.id)"
              class="flex justify-center"
            >
              <Square />
            </a>
          </td>
          <td>{{ todo.content }}</td>
          <td>
            <a href="#" class="flex justify-center">
              <Pencil />
            </a>

            <a href="#" class="flex justify-center">
              <Trash />
            </a>
          </td>
        </tr>
      </tbody>
    </table> -->
    <!-- <div>
      <h1 class="text-2xl gap-12 font-bold mb-6">Add new to-do</h1>
      <div class="flex gap-3">
        <label for="todoContent" class="my-2 hidden md:inline-block">Content</label>
        <input
          type="text"
          name="todoContent"
          id="todoContent"
          class="rounded w-full bg-gray-100 px-3"
          v-model="currentContent"
          v-on:keyup.enter="addTodo"
        />
        <button
          type="submit"
          class="bg-green-300 px-5 py-2 rounded"
          @click="addTodo"
        >
          Add
        </button>
        <a href="#" class="my-2" @click="addTodo">
          <PlusCircle />
        </a>
      </div>
    </div> -->
  </div>
  <a
    target="_blank"
    href="https://github.com/ubeydeozdmr/crema-todo"
    class="rounded text-xs text-center w-full bg-gray-200 absolute bottom-0 left-0"
  >
    Created by Ubeyde Emir Özdemir with ❤️ Click for GitHub link
  </a>
  <!-- <button
    @click="myFunc"
    class="rounded text-sm bg-gray-200 absolute bottom-0 right-0"
  >
    Take a log for console (Just for development)
  </button> -->
</template>

<style scoped>
/* table,
th,
td {
  border: 1px solid black;
}

td {
  vertical-align: center;
} */
</style>
