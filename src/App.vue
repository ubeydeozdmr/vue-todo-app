<script>
import CheckSquare from './icons/check-square.vue';
import Square from './icons/square.vue';
import Pencil from './icons/pencil.vue';
import Trash from './icons/trash.vue';
import PlusCircle from './icons/plus-circle.vue';
import SwitchVertical from './icons/switch-vertical.vue';
import Circle from './icons/circle.vue';
import RecordCircle from './icons/record-circle.vue';
import ChevronRight from './icons/chevron-right.vue';
import ChevronBottom from './icons/chevron-bottom.vue';

export default {
  data() {
    return {
      expandPreferences: false,
      hideBanner: false,
      hideCompletedTodos: false,
      currentContent: '',
      sort: ['date', 'asc'] /* ['date', 'asc'], ['date', 'desc'], ['name', 'asc'] */,
      theme: 'os' /* light, dark, os */,
      todos: [],
      activeTodos: undefined,
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
    if (localStorage.getItem('hideCompletedTodos')) {
      this.hideCompletedTodos = JSON.parse(localStorage.getItem('hideCompletedTodos'));
    } else {
      localStorage.setItem('hideCompletedTodos', JSON.stringify(this.hideCompletedTodos));
    }

    if (localStorage.getItem('hideBanner')) {
      this.hideBanner = JSON.parse(localStorage.getItem('hideBanner'));
    } else {
      localStorage.setItem('hideBanner', JSON.stringify(this.hideBanner));
    }

    if (localStorage.getItem('theme')) {
      this.theme = JSON.parse(localStorage.getItem('theme'));
    } else {
      localStorage.setItem('theme', JSON.stringify(this.theme));
    }

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

    switch (this.theme) {
      case 'os':
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.querySelector('html').classList.add('dark');
        } else {
          document.querySelector('html').classList.remove('dark');
        }
        break;
      case 'light':
        document.querySelector('html').classList.remove('dark');
        break;
      case 'dark':
        document.querySelector('html').classList.add('dark');
        break;
    }

    this.sort[1] === 'asc' ? this.sortTodosByDateAsc() : this.sortTodosByDateDesc();

    this.hideCompletedTodosHandler();
    console.log(this.activeTodos);
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
      let newTodo = {
        id: Math.round(Math.random() * 1000000000000),
        content: this.currentContent,
        date: Date.now(),
        completed: false,
      };

      this.sort[1] === 'asc' ? this.todos.push(newTodo) : this.todos.unshift(newTodo);
      this.hideCompletedTodosHandler();

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
      this.hideCompletedTodosHandler();
      this.saveTodo();
    },
    sortTodosByDateAsc() {
      this.sort[1] = 'asc';
      this.todos.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
      this.hideCompletedTodosHandler();
      this.saveSort();
    },
    sortTodosByDateDesc() {
      this.sort[1] = 'desc';
      this.todos.sort((a, b) => parseFloat(b.date) - parseFloat(a.date));
      this.hideCompletedTodosHandler();
      this.saveSort();
    },
    sortTodosByNameAsc() {
      this.sort[1] = 'asc';
      this.saveSort();
    },
    sortTodosByNameDesc() {
      this.sort[1] = 'desc';
      this.saveSort();
    },
    rearrangeTodos() {},
    hideCompletedTodosHandler() {
      this.activeTodos = this.todos.filter(todo => !todo.completed);
    },
    savePreferences() {
      localStorage.setItem('hideBanner', JSON.stringify(this.hideBanner));
      localStorage.setItem('hideCompletedTodos', JSON.stringify(this.hideCompletedTodos));
    },
    saveTheme() {
      localStorage.setItem('theme', JSON.stringify(this.theme));
    },
    saveSort() {
      localStorage.setItem('sort', JSON.stringify(this.sort));
    },
    saveTodo() {
      localStorage.setItem('data', JSON.stringify(this.todos));
    },
    myFunc() {
      console.log(this.theme);
      console.log(this.sort);
      console.log(this.todos);
    },
  },
  components: {
    CheckSquare,
    Square,
    Pencil,
    Trash,
    PlusCircle,
    SwitchVertical,
    Circle,
    RecordCircle,
    ChevronRight,
    ChevronBottom,
  },
};
</script>

<template>
  <div class="p-6 md:p-12 gap-6 md:gap-12 flex flex-col">
    <div class="w-full flex flex-col gap-3">
      <div>
        <h1 class="text-4xl font-bold dark:text-gray-200">Crema To-Do</h1>
      </div>
      <p v-if="this.todos.length === 0" class="dark:text-gray-300">
        You didn't add any to-do. To create your first to-do, type below then hit enter or
        the + sign.
      </p>
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
            @click="this.sort[1] === 'asc' ? sortTodosByDateDesc() : sortTodosByDateAsc()"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          >
            <!-- SORT &uarr;&darr; -->
            <SwitchVertical />
          </a>
        </div>
      </div>
      <div
        class="w-full flex gap-3 md:gap-6"
        v-if="!this.hideCompletedTodos"
        v-for="todo in todos"
      >
        <div class="w-1/12 flex justify-center">
          <a
            href="#"
            v-if="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <CheckSquare />
          </a>
          <a
            href="#"
            v-else="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
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
            class="w-full dark:bg-gray-800 dark:text-gray-300"
            :class="todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : ''"
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
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
          >
            <Trash />
          </a>
        </div>
      </div>
      <div
        class="w-full flex gap-3 md:gap-6"
        v-if="this.hideCompletedTodos"
        v-for="todo in activeTodos"
      >
        <div class="w-1/12 flex justify-center">
          <a
            href="#"
            v-if="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
          >
            <CheckSquare />
          </a>
          <a
            href="#"
            v-else="todo.completed"
            @click="toggleStatus(todo.id)"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
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
            class="w-full dark:bg-gray-800 dark:text-gray-300"
            :class="todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : ''"
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
            class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
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
            class="rounded w-full bg-gray-100 dark:bg-gray-700 dark:text-white px-3"
            v-model="currentContent"
            v-on:keyup.enter="addTodo"
            placeholder="Add new todo from here..."
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click="addTodo"
            class="text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-200 transition-all duration-200"
          >
            <PlusCircle />
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <a href="#" @click="this.expandPreferences = !this.expandPreferences">
        <h2
          class="text-md text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3"
        >
          <ChevronBottom v-if="this.expandPreferences" />
          <ChevronRight v-else /> Preferences
        </h2>
      </a>
      <div class="flex flex-col gap-6" v-if="this.expandPreferences">
        <div class="flex gap-6">
          <p class="dark:text-gray-400 text-sm">Theme:</p>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.theme = 'os';
              this.saveTheme();
            "
          >
            <RecordCircle v-if="this.theme === 'os'" />
            <Circle v-else />
            <p>System</p>
          </a>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.theme = 'light';
              this.saveTheme();
            "
          >
            <RecordCircle v-if="this.theme === 'light'" />
            <Circle v-else />
            <p>Light</p>
          </a>
          <a
            href="#"
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              this.theme = 'dark';
              this.saveTheme();
            "
          >
            <RecordCircle v-if="this.theme === 'dark'" />
            <Circle v-else />
            <p>Dark</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">
          NOTE: After changing the theme, you need to refresh the page.
        </p>
        <a
          href="#"
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.hideBanner = !this.hideBanner;
            this.savePreferences();
          "
        >
          <CheckSquare v-if="this.hideBanner" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Created by" banner</p>
        </a>
        <a
          href="#"
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            this.hideCompletedTodos = !this.hideCompletedTodos;
            this.savePreferences();
            this.hideCompletedTodosHandler();
          "
        >
          <CheckSquare v-if="this.hideCompletedTodos" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide completed todos</p>
        </a>
      </div>
    </div>
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
    v-if="!this.hideBanner"
    target="_blank"
    href="https://github.com/ubeydeozdmr/crema-todo"
    class="rounded text-xs text-center w-full bg-gray-200 dark:bg-gray-700 dark:text-gray-300 fixed bottom-0 left-0"
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

<style scoped></style>
